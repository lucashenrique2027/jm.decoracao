import { db } from '../../../models/db.js';
import { teste } from '../../../models/schema.js';

const testes = async (req, res) => {
    const data = await db.select().from(teste);
    res.json(data);
}

export default testes;