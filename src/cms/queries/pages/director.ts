import video from "../utils/video";
import responsiveImg from "../utils/responsiveImg";
import seoMetaTags from "../utils/seoMetaTags";

export default `
    id
    _modelApiKey
    name
    slug
    ${seoMetaTags}
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
                url
                ${responsiveImg}
            }
        }
    }
`;
