import responsiveImg from "../utils/responsiveImg";

export default `
    id
    _modelApiKey
    title
    slug
    news {
        id
        _modelApiKey
        slug
        title
        leftAlignedTitle
        rightAlignedTitle
        date
        category {
            category
        }
        cover {
            ${responsiveImg}
        }
    }
`;
