import link from "../utils/link";
import img from "../utils/img";

export default `
    ... on BlockquoteModuleRecord {
        _modelApiKey
        id
        text
    }
    ... on ImagesModuleRecord {
        _modelApiKey
        id
        images {
            ${img}
        }
    }
    ... on IndentedTextModuleRecord {
        _modelApiKey
        id
        text
    }
    ... on LinksModuleRecord {
        _modelApiKey
        id
        links {
            ${link}
        }
    }
    ... on TitleContentModuleRecord {
        _modelApiKey
        id
        items {
            title
            content
        }
    }
    ... on TwoColsModuleRecord {
        _modelApiKey
        id
        items {
            title
            lines {
                leftColText
                rightColText
            }
        }
    }
    ... on WysiwygModuleRecord {
        _modelApiKey
        id
        content
    }
`;
