const db = require('../config/db');

// 1. GET ALL MASTER SKILLS
async function getAllSkills(req, res) {
  try {
    const skills = await db.query('SELECT * FROM skills ORDER BY category, name ASC');

    const grouped = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
      grouped
    });
  } catch (err) {
    console.error('[Get Skills Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch skills catalog.' });
  }
}

// 2. CREATE NEW SKILL (Admin Only)
async function createSkill(req, res) {
  try {
    const { name, category = 'Technical' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    const result = await db.query(
      'INSERT INTO skills (name, category) VALUES (?, ?)',
      [name.trim(), category]
    );

    return res.status(201).json({
      success: true,
      message: 'Skill added to master catalog!',
      skillId: result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Skill already exists in catalog.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create skill.' });
  }
}

module.exports = {
  getAllSkills,
  createSkill
};
