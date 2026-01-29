import responsiveImg from "../utils/responsiveImg";

export default `
    id
    _modelApiKey
    name
    slug
    client
    directors {
        id
        name
        slug
        _modelApiKey
    }
    video {
        id
        wiredriveUrl
        poster {
            url
            ${responsiveImg}
        }
    }
    preview {
        id
        wiredriveUrl
        poster {
            url
            ${responsiveImg}
        }
    }
`;
