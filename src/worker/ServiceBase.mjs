import Base               from '../core/Base.mjs';
import Message            from './Message.mjs';
import RemoteMethodAccess from './mixin/RemoteMethodAccess.mjs';

/**
 * @class Neo.worker.ServiceBase
 * @extends Neo.core.Base
 * @abstract
 */
class ServiceBase extends Base {
    /**
     * @member {Object[]|null} channelPorts=null
     * @protected
     */
    channelPorts = null
    /**
     * @member {Client|null} lastClient=null
     * @protected
     */
    lastClient = null
    /**
     * @member {Object[]} promises=[]
     * @protected
     */
    promises = []
    /**
     * @member {String[]} remotes=[]
     * @protected
     */
    remotes = []

    static getConfig() {return {
        /**
         * @member {String} className='Neo.worker.ServiceBase'
         * @protected
         */
        className: 'Neo.worker.ServiceBase',
        /**
         * @member {String} cacheName='neo-runtime'
         */
        cacheName: 'neo-runtime',
        /**
         * @member {String[]|null} cachePaths
         */
        cachePaths: [
            'raw.githubusercontent.com/',
            '/dist/production/',
            '/fontawesome',
            '/resources/'
        ],
        /**
         * @member {String[]|Neo.core.Base[]|null} mixins=[RemoteMethodAccess]
         */
        mixins: [RemoteMethodAccess],
        /**
         * Remote method access for other workers
         * @member {Object} remote={app: [//...]}
         * @protected
         */
        remote: {
            app: [
                'clearCache',
                'clearCaches',
                'preloadAssets'
            ]
        },
        /**
         * @member {String|null} workerId=null
         * @protected
         */
        workerId: null
    }}

    /**
     * @param {Object} config
     */
    construct(config) {
        super.construct(config);

        let me   = this,
            bind = name => me[name].bind(me);

        me.channelPorts = [];

        Object.assign(globalThis, {
            onactivate: bind('onActivate'),
            onfetch   : bind('onFetch'),
            oninstall : bind('onInstall'),
            onmessage : bind('onMessage')
        });

        Neo.currentWorker = me;
        Neo.workerId      = me.workerId;
    }

    /**
     * @param {String} name=this.cacheName
     */
    clearCache(name=this.cacheName) {
        caches.keys()
            .then(cacheNames     => cacheNames.filter(cacheName => cacheName === name))
            .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
    }

    /**
     *
     */
    clearCaches() {
        caches.keys()
            .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
    }

    /**
     * @param {Client} client
     */
    createMessageChannel(client) {
        let me      = this,
            channel = new MessageChannel(),
            port    = channel.port2;

        channel.port1.onmessage = me.onMessage.bind(me);

        me.sendMessage('app', {action: 'registerPort', transfer: port}, [port]);

        me.channelPorts.push({
            clientId   : client.id,
            destination: 'app',
            port       : channel.port1
        });
    }

    /**
     *
     * @param {String} destination
     * @param {String} clientId=this.lastClient.id
     * @returns {MessagePort|null}
     */
    getPort(destination, clientId=this.lastClient?.id) {
        for (let port of this.channelPorts) {
            if (clientId === port.clientId && destination === port.destination) {
                return port.port;
            }
        }

        return null;
    }

    /**
     * Ignore the call in case there is no connected client in place yet
     */
    initRemote() {
        let me           = this,
            lastClientId = me.lastClient?.id;

        if (lastClientId && !me.remotes.includes(lastClientId)) {
            me.remotes.push(lastClientId);
            super.initRemote();
        }
    }

    /**
     * @param {ExtendableMessageEvent} event
     */
    onActivate(event) {
        console.log('onActivate', event);
    }

    /**
     * @param {Client} source
     */
    onConnect(source) {
        console.log('onConnect', source);

        this.createMessageChannel(source);
        this.initRemote();
    }

    /**
     * @param {ExtendableMessageEvent} event
     */
    onFetch(event) {
        let hasMatch = false,
            request  = event.request,
            key;

        for (key of this.cachePaths) {
            if (request.url.includes(key)) {
                hasMatch = true;
                break;
            }
        }

        hasMatch && event.respondWith(
            caches.match(request)
                .then(cachedResponse => cachedResponse || caches.open(this.cacheName)
                .then(cache          => fetch(request)
                .then(response       => cache.put(request, response.clone())
                .then(()             => response)
            )))
        );
    }

    /**
     * @param {ExtendableMessageEvent} event
     */
    onInstall(event) {
        console.log('onInstall', event);
        globalThis.skipWaiting();
    }

    /**
     * For a client based message we receive an ExtendableMessageEvent,
     * for a MessageChannel based message a MessageEvent
     * @param {ExtendableMessageEvent|MessageEvent} event
     */
    onMessage(event) {
        let me      = this,
            data    = event.data,
            action  = data.action,
            replyId = data.replyId,
            promise;

        if (event.source) { // ExtendableMessageEvent
            me.lastClient = event.source;
        }

        if (!action) {
            throw new Error('Message action is missing: ' + data.id);
        }

        if (action !== 'reply') {
            me['on' + Neo.capitalize(action)](data, event);
        } else if (promise = action === 'reply' && me.promises[replyId]) {
            promise[data.reject ? 'reject' : 'resolve'](data.data);
            delete me.promises[replyId];
        }
    }

    /**
     * @param {Object} msg
     * @param {ExtendableMessageEvent} event
     */
    onPing(msg, event) {
        this.resolve(msg, {originMsg: msg});
    }

    /**
     * @param {Object} msg
     * @param {ExtendableMessageEvent} event
     */
    onRegisterNeoConfig(msg, event) {
        Neo.config = Neo.config || {};
        Object.assign(Neo.config, msg.data);

        this.onConnect(event.source);
    }

    /**
     * @param {Object} data
     */
    preloadAssets(data) {
        console.log('preloadAssets', data);
    }

    /**
     * @param {String} dest app, data, main or vdom (excluding the current worker)
     * @param {Object} opts configs for Neo.worker.Message
     * @param {Array} [transfer] An optional array of Transferable objects to transfer ownership of.
     * If the ownership of an object is transferred, it becomes unusable (neutered) in the context it was sent from
     * and becomes available only to the worker it was sent to.
     * @returns {Promise<any>}
     */
    promiseMessage(dest, opts, transfer) {
        let me = this;

        return new Promise(function(resolve, reject) {
            let message = me.sendMessage(dest, opts, transfer),
                msgId   = message.id;

            me.promises[msgId] = {reject, resolve};
        });
    }

    /**
     * @param {String} dest app, data, main or vdom (excluding the current worker)
     * @param {Object} opts configs for Neo.worker.Message
     * @param {Array} [transfer] An optional array of Transferable objects to transfer ownership of.
     * If the ownership of an object is transferred, it becomes unusable (neutered) in the context it was sent from
     * and becomes available only to the worker it was sent to.
     * @returns {Neo.worker.Message}
     * @protected
     */
    sendMessage(dest, opts, transfer) {
        opts.destination = dest;

        let message = new Message(opts),
            port    = this.getPort(dest) || this.lastClient;

        port.postMessage(message, transfer);
        return message;
    }
}

Neo.applyClassConfig(ServiceBase);

export default ServiceBase;
