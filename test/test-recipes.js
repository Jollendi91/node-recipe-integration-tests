const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipes', function() {
    
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('Should list recipes on GET', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.at.least(1);

                const expectedKeys = ['id', 'name', 'ingredients'];
                res.body.forEach(function(item) {
                    expect(item).to.be.an('object');
                    expect(item).to.include.keys(expectedKeys);
            });
        });
    });

    it('Should add a recipe on POST', function() {
        const newRecipe = {name: 'Salad', ingredients: ['lettuce', 'dressing', 'croutons']};
        return chai.request(app)
            .post('/recipes')
            .send(newRecipe)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.include.keys('id', 'name', 'ingredients');
                expect(res.body.id).to.not.equal(null);
                expect(res.body).to.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
            });
    });

    it('Should update a recipe on PUT', function() {
        const updateRecipe = {
            name: 'PB&J',
            ingredients: ['peanut butter', 'jelly', 'bread']
        };
        
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                updateRecipe.id = res.body[0].id;

                return chai.request(app)
                    .put(`/recipes/${updateRecipe.id}`)
                    .send(updateRecipe);
            })

            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.deep.equal(updateRecipe);
            });
    });

    it('Should remove a recipe on DELETE', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            });
    });
});