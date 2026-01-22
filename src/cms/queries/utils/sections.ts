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
    }
    ... on LinksModuleRecord {
        _modelApiKey
        id
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
