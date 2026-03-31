function generateRoadmap(missingSkills) {
  let roadmap = [];

  if (missingSkills.includes("python")) {
    roadmap.push("Learn Python basics");
    roadmap.push("Practice Python projects");
    roadmap.push("Learn libraries like NumPy/Pandas");
  }

  if (missingSkills.includes("node.js")) {
    roadmap.push("Learn Node.js fundamentals");
    roadmap.push("Build REST APIs using Express");
  }

  if (missingSkills.includes("javascript")) {
    roadmap.push("Learn JavaScript fundamentals");
    roadmap.push("Practice DOM and ES6 concepts");
  }

  if (missingSkills.includes("java")) {
    roadmap.push("Learn Java OOP concepts");
    roadmap.push("Practice DSA in Java");
  }

  return roadmap;
}

module.exports = generateRoadmap;