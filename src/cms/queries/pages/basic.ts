import sections from "../utils/sections";
import link from "../utils/link";

export default `
    id
    _modelApiKey    
    title
    slug
    content {
        ${sections}
    }
    subnavigation {
        blocks {
            links {
                ${link}
            }
        }
    }
`;
