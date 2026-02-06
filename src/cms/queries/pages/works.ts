import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    slug
    ${seoMetaTags}
    videos {
        id
        featured
        video {
            _modelApiKey
            id
            slug
            name
            client
            previewRss
            directors {
                id
                name
                slug
                _modelApiKey
            }
        }
    }
`;
