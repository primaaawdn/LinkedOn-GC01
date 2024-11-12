class Post {
    constructor(_id, content, tags, imgUrl, authorId) {
        this._id = _id;
        this.content = content;
        this.tags = tags;
        this.imgUrl = imgUrl;
        this.authorId = authorId;
        this.comments = [];
        this.likes = [];
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = Post;
