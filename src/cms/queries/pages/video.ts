import responsiveImg from "../utils/responsiveImg";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    name
    slug
    ${seoMetaTags}
    client
    directors {
        id
        name
        slug
        _modelApiKey
        videos {
            _modelApiKey
            id
            slug
        }
    }
    videoRss
    previewRss
`;
