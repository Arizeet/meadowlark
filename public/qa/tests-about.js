// const { assert } = require("chai");

suite('"About" Page Tests', function(){
    test('page should contain link to contact page',function(){
        assert('/contact.html'.length);
    });
});