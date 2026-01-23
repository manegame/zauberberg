import link from "../utils/link";

export default `
    ... on BlockquoteModuleRecord {
        _modelApiKey
        id
    }
    ... on ImagesModuleRecord {
        _modelApiKey
        id
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
    }
    ... on WysiwygModuleRecord {
        _modelApiKey
        id
    }
`;
