import Base from './Base.mjs';

/**
 * @class RealWorld2.api.Article
 * @extends RealWorld2.api.Base
 */
class Article extends Base {
    static config = {
        /**
         * @member {String} className='RealWorld2.api.Article'
         * @protected
         */
        className: 'RealWorld2.api.Article',
        /**
         * @member {String} resource='/articles'
         */
        resource: '/articles'
    }

    /**
     * @param {String} slug
     * @param {Number} id
     */
    deleteComment(slug, id) {
        return this.delete({
            url: `/articles/${slug}/comments/${id}`
        });
    }

    /**
     * @param {String} slug
     */
    getComments(slug) {
        return this.get({
            url: `/articles/${slug}/comments`
        });
    }

    /**
     * @param {String} slug
     * @param {Object} opts
     */
    postComment(slug, opts) {
        return this.post({
            ...opts,
            url: `/articles/${slug}/comments`
        });
    }
}

Neo.setupClass(Article);

let instance = Neo.create(Article);

Neo.applyToGlobalNs(instance);

export default instance;
