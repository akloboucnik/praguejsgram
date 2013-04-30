/*global App */
(function() {
'use strict';

var CLIENT_ID = '9a40e8f1322a47cc8df6e742aedf6f18';

window.App = Em.Application.create({
  LOG_TRANSITIONS: true
});

App.Router.map(function() {
    this.route('detail', { path: '/:image_id'});
});

App.Image = Em.Object.extend({
    // example of computed property
    attribution: function() {
        // we have to mark string as htmlSafe for handlebars for not escaping A tag
        return 'by <a href="http://instagram.com/%@1">%@1</a>'.fmt(this.get('user')).htmlSafe();
    }.property('user')
});

App.Image.reopenClass({
    nextPageEndpoint: 'https://api.instagram.com/v1/tags/praguejs/media/recent?client_id='+CLIENT_ID+'&callback=?',
    detailEndpoint: 'https://api.instagram.com/v1/media/%@?client_id='+CLIENT_ID+'&callback=?',
    findAll: function() {
        var images = Em.ArrayProxy.create({
            isLoaded: false,
            isError: false,
            content: []
        });
        Ember.$.getJSON(this.nextPageEndpoint).then(
            function(response) {
                response.data.forEach(function (image) {
                    images.pushObject(App.Image.create({
                        id: image.id,
                        src: image.images.low_resolution.url,
                        bigSrc: image.images.standard_resolution.url,
                        desc: image.caption && image.caption.text,
                        user: image.user.username,
                        link: image.link,
                        isLoaded: true
                    }));
                });
                images.set('isLoaded', true);
            },
            function(err) {
                images.set('isError', true);
            }
        );

        return images;
    },

    findOne: function(id) {
        var image = App.Image.create({
            isLoaded: false,
            isError: false,
        });
        Ember.$.getJSON(this.detailEndpoint.fmt(id)).then(
            function(response) {
                var data = response.data;
                image.setProperties({
                    id: data.id,
                    src: data.images.low_resolution.url,
                    bigSrc: data.images.standard_resolution.url,
                    desc: data.caption && data.caption.text,
                    user: data.user.username,
                    link: data.link,
                    isLoaded: true
                });
            },
            function(err) {
                image.set('isError', true);
            }
        );
        return image;
    }
});

App.IndexRoute = Em.Route.extend({
    model: function() {
        return App.Image.findAll();
    }
});

App.DetailRoute = Em.Route.extend({
    model: function(params) {
        return App.Image.findOne(params.image_id);
    }
});

App.IndexController = Em.ArrayController.extend();

})();