const Store = require('../models/Store');
const { createValidation } = require('../validators/storeValidator');
const {authenticateToken} = require('../services/utils');

const createStore = async (req, res) => {
    //TODO use Logs
    //TODO mudar nrs de httpstatus para enum

    // Validate fields in the request body
    const {error} = createValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Save the new store's schedules in the DB
    let storeSchedules = [];
    req.body.schedules.forEach( s => storeSchedules.push(s));

    // Create a new store
    const store = new Store({
        name: req.body.name,
        /*capacity: req.body.capacity,
        openingHour: req.body.openingHour < req.body.closingHour ? req.body.openingHour : req.body.closingHour,
        closingHour: req.body.closingHour > req.body.openingHour ? req.body.closingHour : req.body.openingHour,*/
        schedules: storeSchedules,
        ownerId: req.user.id
    });

    try {
        for (const s of store.schedules) {
            await s.save();
        }

        // Save the new store in the DB
        const newStore = await store.save();
        res.send({store: newStore._id});

    }catch (error) {
        //TODO diferenciar se erro na bd de conexao ou se erro por ja existir user

        // User already exists
        res.status(400)
            .send(error);
    }
};

//TODO verificar se openingHour<closingHour e trocar se necessário


module.exports = { createStore };