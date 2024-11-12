class User {
    constructor(_id, name, username, email, password) {
        this._id = _id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
    }
}

module.exports = User;
