
import React from "react";
import { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { BMC } from "@/entities/BMC";
import { SavedItem } from "@/entities/SavedItem";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AutoTextarea from "@/components/common/AutoTextarea";
import { FLAGS } from "@/components/common/flags";

const BLOCKS = [
  { key: "customer_segments", label: "Customer Segments" },
  { key: "value_props", label: "Value Propositions" },
  { key: "channels", label: "Channels" },
  { key: "customer_relationships", label: "Customer Relationships" },
  { key: "revenue_streams", label: "Revenue Streams" },
  { key: "key_resources", label: "Key Resources" },
  { key: "key_activities", label: "Key Activities" },
  { key: "key_partnerships", label: "Key Partnerships" },
  { key: "cost_structure", label: "Cost Structure" }
];

export default function BMCBuilder() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [blocks, setBlocks] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [valueHints, setValueHints] = useState("");
  const [customerHints, setCustomerHints] = useState("");
  const [revenueHints, setRevenueHints] = useState("");

  useEffect(()=>{
    Project.list("-created_date").then(p=>{
      setProjects(p);
      const pid = p[0]?.id||"";
      setProjectId(pid);
      if (pid) {
        const proj = p[0];
        setSummary(proj.description || "");
        setValueHints((proj.value_props||[]).join("; "));
      }
    });
  }, []);

  // Local autosave of blocks by project - Load
  useEffect(()=>{
    if (!projectId) return;
    const key = `bmc_${projectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { const parsed = JSON.parse(saved); setBlocks(parsed.blocks || {}); } catch (e) {
        console.error("Failed to parse saved BMC blocks from localStorage:", e);
      }
    }
  }, [projectId]);

  // Local autosave of blocks by project - Save
  useEffect(()=>{
    if (!projectId) return;
    // Debounce saving to avoid too frequent updates
    const id = setInterval(()=>{
      localStorage.setItem(`bmc_${projectId}`, JSON.stringify({ blocks }));
    }, 6000); // Save every 6 seconds
    return ()=>clearInterval(id); // Cleanup on unmount or dependency change
  }, [blocks, projectId]);

  const generate = async () => {
    if (!projectId) return;
    setLoading(true);

    // Pull lightweight saved items to enrich context
    let context = "";
    try {
      // Dynamic import to ensure SavedItem is loaded only when needed
      const { SavedItem: DynamicSavedItem } = await import("@/entities/SavedItem");
      const related = await DynamicSavedItem.filter({ project_id: projectId });
      const snippets = related.slice(0, 6).map(x => `${x.tab_name}/${x.subtab_name}: ${x.content_text||""}`).join("\n");
      if (snippets) {
        context = `SAVED CONTEXT:\n${snippets}`;
      }
    } catch (e) {
      console.error("Failed to fetch saved items for context:", e);
    }

    const res = await InvokeLLM({
      prompt: `SYSTEM: Build a Business Model Canvas with 9 sections for the selected project.
Use the user's inputs and any provided project context. Be concise and practical.

USER INPUTS:
Summary: ${summary || "N/A"}
Value Hints: ${valueHints || "N/A"}
Customer Hints: ${customerHints || "N/A"}
Revenue Hints: ${revenueHints || "N/A"}

${context}

Return JSON:
{"customer_segments":"","value_props":"","channels":"","customer_relationships":"","revenue_streams":"","key_resources":"","key_activities":"","key_partnerships":"","cost_structure":""}`,
      response_json_schema: {
        type: "object",
        properties: Object.fromEntries(BLOCKS.map(b=>[b.key, {type:"string"}]))
      }
    });
    setBlocks(res || {});
    setLoading(false);
  };

  // This function might be unused if per-block save buttons are removed,
  // but keeping it in case it's called elsewhere or for future features.
  const saveBlock = async (k) => {
    const me = await User.me();
    // Ensure BMC content is always a string
    const bmcContent = blocks[k] || "";

    await BMC.create({ project_id: projectId, user_id: me?.id || "", block_key: k, content: bmcContent });
    await SavedItem.create({
      user_id: me?.id || "",
      project_id: projectId,
      tab_name: "BMC Builder",
      subtab_name: "Canvas",
      title: `BMC - ${BLOCKS.find(b=>b.key===k)?.label}`,
      content_type: "text",
      content_text: bmcContent.slice(0, 240), // Truncate for display in saved items
      content_json: { key: k, content: bmcContent }
    });
    alert("Saved to Project");
  };

  const clearAllBlocks = () => {
    setBlocks({});
    // Optionally clear localStorage for this project as well
    if (projectId) {
      localStorage.removeItem(`bmc_${projectId}`);
    }
  };

  // New export helpers without external libraries
  const renderBmcHtml = () => {
    const projName = projects.find(p => p.id === projectId)?.product_name || "Selected Project";
    const today = new Date().toISOString().slice(0,10);
    const sections = BLOCKS.map(b => {
      const content = (blocks[b.key] || "N/A")
        .toString()
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");
      return `<h2>${b.label}</h2><p>${content}</p>`;
    }).join("");
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>BMC - ${projName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { font-size: 22px; margin-bottom: 8px; }
            h2 { font-size: 16px; margin: 16px 0 6px; }
            p { font-size: 13px; line-height: 1.5; }
            .meta { color: #475569; font-size: 12px; margin-bottom: 16px; }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(2, minmax(0,1fr)); 
              gap: 12px; 
            }
            .grid h2 {
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            @media print {
              .no-print { display:none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align:right;margin-bottom:12px;">
            <button onclick="window.print()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;background:#e2e8f0;cursor:pointer;">Print</button>
          </div>
          <h1>Business Model Canvas — ${projName}</h1>
          <div class="meta">Exported ${today}</div>
          <div class="grid">
            ${sections}
          </div>
        </body>
      </html>
    `;
  };

  const exportToPdf = () => {
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups for this site to export to PDF.");
      return;
    }
    win.document.open();
    win.document.write(renderBmcHtml());
    win.document.close();
    // Instruct the new window to print after content is loaded
    win.onload = () => {
      win.print();
    };
  };

  const exportToDocx = () => {
    const projName = projects.find(p => p.id === projectId)?.product_name || "Project";
    const today = new Date().toISOString().slice(0,10);
    const html = renderBmcHtml();
    
    // Create a Blob with HTML content and set its type to MS Word document
    const blob = new Blob(['\ufeff', html], {
      type: "application/msword"
    });

    // Create a download link for the Blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BMC_${projName.replace(/\s/g, '_')}_${today}.doc`; // Sanitize project name for filename
    
    // Programmatically click the link to trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up by revoking the object URL and removing the link
    URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={projectId} onChange={(e)=>setProjectId(e.target.value)} className="border rounded px-3 py-2">
            {projects.map(p=><option key={p.id} value={p.id}>{p.product_name}</option>)}
          </select>
          <button onClick={generate} disabled={loading || !projectId} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">
            {loading ? "Generating…" : "Generate BMC"}
          </button>
          <button onClick={clearAllBlocks} className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2">
            Clear All
          </button>
          <button onClick={exportToPdf} className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2">
            Export to PDF
          </button>
          <button onClick={exportToDocx} className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2">
            Export to DOC
          </button>
        </div>

        {/* User input hints */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/80 border rounded-xl p-4">
            <div className="font-semibold mb-2">Product Summary</div>
            <AutoTextarea value={summary} onChange={(e)=>setSummary(e.target.value)} placeholder="Short product summary…" />
          </div>
          <div className="bg-white/80 border rounded-xl p-4">
            <div className="font-semibold mb-2">Value Proposition Hints</div>
            <AutoTextarea value={valueHints} onChange={(e)=>setValueHints(e.target.value)} placeholder="Unique value, benefits…" />
          </div>
          <div className="bg-white/80 border rounded-xl p-4">
            <div className="font-semibold mb-2">Customer Hints</div>
            <AutoTextarea value={customerHints} onChange={(e)=>setCustomerHints(e.target.value)} placeholder="Personas, segments, needs…" />
          </div>
          <div className="bg-white/80 border rounded-xl p-4">
            <div className="font-semibold mb-2">Revenue Hints</div>
            <AutoTextarea value={revenueHints} onChange={(e)=>setRevenueHints(e.target.value)} placeholder="Pricing, revenue streams…" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {BLOCKS.map(b=>(
            // Replaced shadcn Card components with custom divs for styling consistency
            <div key={b.key} className="bg-white/80 border rounded-xl p-4">
              <div className="font-semibold mb-2">{b.label}</div>
              <AutoTextarea value={blocks[b.key] || ""} onChange={(e)=>setBlocks(prev=>({...prev,[b.key]: e.target.value}))} placeholder={`AI suggestion will appear here. Edit as needed for ${b.label}.`} />
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 rounded border" onClick={()=>generate()} disabled={loading}>Regenerate</button>
                {/* Removed the individual Save button as per instructions */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
