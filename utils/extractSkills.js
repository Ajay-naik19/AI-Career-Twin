const skillsList = ["java", "python", "c", "javascript", "html", "css", "node.js"];

function extractSkills(text) {
  if (!text) return [];
  text = text.toLowerCase();
  return skillsList.filter(skill => text.includes(skill));
}

module.exports = extractSkills;