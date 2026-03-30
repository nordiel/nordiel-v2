export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addCollection("posts", (api) => api.getFilteredByTag("posts"));
}
