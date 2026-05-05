import {definePlugin} from 'sanity'

export const singletonPlugin = (types: string[]) => {
    return definePlugin({
        name: 'singletonPlugin',
        document: {
            newDocumentOptions: (prev, {creationContext}) => {
                if (creationContext.type === 'global') {
                    return prev.filter((templateItem) => !types.includes(templateItem.templateId))
                }

                return prev
            },
            actions: (prev, {schemaType}) => {
                if (types.includes(schemaType)) {
                    return prev.filter(({action}) => action !== 'duplicate')
                }

                return prev
            },
        },
    })
}