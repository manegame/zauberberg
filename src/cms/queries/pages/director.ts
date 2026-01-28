import video from "../utils/video";
import responsiveImg from "../utils/responsiveImg";
export default `
    id
    _modelApiKey
    name
    slug
    introduction
    biography
    color {
        hex
    }
    sidebar {
        id
        title
        items {
            id
            label
            link
        }
    }
    photo {
        ${responsiveImg}
    }
    showcase {
        ${video}
    }
    videos {
        _modelApiKey
        id
        slug
        name
        client
        preview {
            id
            wiredriveUrl
            poster {
                ${responsiveImg}
            }
        }
    }
`;
