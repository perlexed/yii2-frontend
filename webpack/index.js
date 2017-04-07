const runner = require('./runner');
const webpackEasy = require('webpack-easy');

const api = module.exports = {

    _entries: [],

    /**
     * Index js. Core module at first
     * @param {string} path
     */
    base(path) {
        this._entries.push(
            webpackEasy.glob(path)
                .then(files => (
                    files.sort(file => file.indexOf('app/core/') !== -1 ? -1 : 1))
                )
                .then(result => ({
                    index: result,
                }))
        );
    },

    /**
     * Module styles
     * @param {string} path
     * @param {null|string} name
     */
    styles(path, name = null) {
        if (typeof name === 'string') {
            this._entries.push(
                webpackEasy.glob(path)
                    .then(result => ({
                        ['style' + (name ? '-' + name : '')]: result
                    }))
            );
        } else {
            this._entries.push(
                webpackEasy.glob(path)
                    .then(result => result.reduce((obj, file) => {
                            const name = file.match(/([^\/]+)\.less$/)[1].replace(/^index/, 'style');
                            obj[name] = obj[name] || [];
                            obj[name].push(file);
                            return obj;
                        }, {})
                    )
            );
        }
    },

    /**
     * PHP widgets. Only widgets with php file. Filter /path/MY_WIDGET/MY_WIDGET.js
     * @param {string} path
     */
    widgets(path) {
        this._entries.push(
            webpackEasy.glob(path)
                .then(files => {
                    let phpWidgets = files
                        .filter(file => file.match(/\.php$/))
                        .map(file => file.match(/([^\/]+)\.php$/)[1]);

                    return files
                        .filter(file => file.match(/\.jsx?$/))
                        .filter(file => phpWidgets.indexOf(file.match(/([^\/]+)\.jsx?$/)[1]) !== -1)
                        .filter(file => file.match(/([^\/]+)\.jsx?$/)[1] === file.match(/([^\/]+)\/[^\/]+?$/)[1]);
                })
                .then(result => result.reduce((obj, file) => {
                        obj[file.match(/([^\/]+)\.js?$/)[1]] = file;
                        return obj;
                    }, {})
                )
        );
    }

};

setTimeout(() => {
    Promise.all(api._entries)
        .then(result => {
            runner(Object.assign.apply(null, result));
        })
        .catch(e => console.log(e));
});