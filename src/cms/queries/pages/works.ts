import responsiveImg from "../utils/responsiveImg";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    slug
    ${seoMetaTags}
    videos {
        id
        video {
            _modelApiKey
            id
            slug
            name
            client
            preview {
                id
                wiredriveUrl
                poster {
                    url
                    ${responsiveImg}
                }
            }
            directors {
                id
                name
                slug
                _modelApiKey
            }
        }
    }
`;
