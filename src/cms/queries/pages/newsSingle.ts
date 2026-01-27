import responsiveImg from "../utils/responsiveImg";
import sections from "../utils/sections";

export default `
    id
    _modelApiKey
    title
    slug
    leftAlignedTitle
    rightAlignedTitle
    date
    category {
        category
    }
    cover {
        ${responsiveImg}
    }
    coverSize
    content {
        ${sections}
    }
`;
