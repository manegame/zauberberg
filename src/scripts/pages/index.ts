import DirectorsPage from "./Directors";
import Director from "./Director";
import type Page from "./Page";

const PAGE_BY_TEMPLATE: Record<string, typeof Page> = {
    directors_page: DirectorsPage,
    director: Director,
};

export default (template: string | undefined) => {
    const PageClass = PAGE_BY_TEMPLATE[template || ""] || null;
    return PageClass;
};
