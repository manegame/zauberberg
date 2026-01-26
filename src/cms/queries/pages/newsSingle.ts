import img from "../utils/img";
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
        ${img}
    }
    content {
        ${sections}
    }
`;
