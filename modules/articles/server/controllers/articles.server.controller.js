'use strict';

/**
 * Module dependencies.
 */
 var path = require('path'),
 mongoose = require('mongoose'),
 Article = mongoose.model('Article'),
 errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a article
 */
 exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Show the current article
 */
 exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a article
 */
 exports.update = function (req, res) {
  var article = req.article;
  var uuid = require('node-uuid');
  article.title = req.body.title;
  article.content = req.body.content;  
  article.comments = req.body.comments;
  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });

};

/**
 * Delete an article
 */
 exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

// approve comments
exports.approve = function (req, res) {
 var article = req.article;
 var commentId = req.body.commentId;
 var comments = [];
 for (var i = 0, len = article.comments.length; i < len; i++) {
  if (article.comments[i]._id === commentId){
    article.comments[i].status = 'approved';
  }
  comments.push(article.comments[i]); 
}
res.json(comments); 
};

// post a  comment
exports.comment = function (req, res) {
 var article = req.article;
 var uuid = require('node-uuid');
 var comments = article.comments;
 var user = {'_id': req.user._id, 'displayName': req.user.displayName}
 comments.push({'_id': uuid.v4(), 'data': req.body.comment, 'status': 'pending', 'user': user });
res.json(comments); 
};

/**
 * List of Articles
 */
 exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};


/**
 * Article middleware
 */
 exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};
