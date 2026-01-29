import responsiveImg from "../utils/responsiveImg";

export default `
    id
    _modelApiKey
    slug
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
