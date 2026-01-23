import video from "../utils/video";

export default `
    id
    _modelApiKey
    title
    directors {
        _modelApiKey
        id
        name
        slug
        showcase {
            ${video}
        }
    }
`;
