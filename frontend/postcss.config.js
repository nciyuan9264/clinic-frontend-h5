export default {
    plugins: {
        'postcss-pxtorem': {
            rootValue: 20,
            unitPrecision: 5,
            propList: ['*'],
            selectorBlackList: [],
            replace: true,
            mediaQuery: false,
            minPixelValue: 0,
        },
    },
};
