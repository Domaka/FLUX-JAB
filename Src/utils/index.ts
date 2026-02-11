
const normalizePageName = (rawName: string) => {
    if (!rawName) {
        return '';
    }
    return rawName
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
};

export function getPageSlug(pageName: string) {
    const [path] = (pageName ?? '').split('?');
    return normalizePageName(path);
}

export function createPageUrl(pageName: string) {
    const [path, query] = (pageName ?? '').split('?');
    const slug = getPageSlug(path);
    const querySuffix = query ? `?${query}` : '';
    return slug ? `/${slug}${querySuffix}` : '/';
}