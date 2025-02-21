import Base from './Base.mjs';

/**
 * @class RealWorld2.api.User
 * @extends RealWorld2.api.Base
 */
class User extends Base {
    static config = {
        /**
         * @member {String} className='RealWorld2.api.User'
         * @protected
         */
        className: 'RealWorld2.api.User',
        /**
         * @member {String} resource='/tags'
         */
        resource: '/users'
    }
}

Neo.setupClass(User);

let instance = Neo.create(User);

Neo.applyToGlobalNs(instance);

export default instance;
