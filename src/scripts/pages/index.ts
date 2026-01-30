import DirectorsPage from "./Directors";
import Director from "./Director";
import Page from "./Page";

const DEFAULT_PAGE = Page;

const PAGE_BY_TEMPLATE: Record<string, typeof Page> = {
    directors_page: DirectorsPage,
    director: Director,
};

export const getPageClass = (template: string) => {
    const PageClass = PAGE_BY_TEMPLATE[template || ""] || DEFAULT_PAGE;
    return PageClass;
};

export const getPage = (template: string, doc?: Document) => {
    console.log(doc);

    const PageClass = getPageClass(template);
    return new PageClass(template, doc);
};
