export const toSerializableArray = <T>(data: unknown): T[] => {
    if (!Array.isArray(data)) {
        throw new Error('Se esperaba un array');
    }

    return data.map((item) => {
        if (item && (item as any)._id) {
            (item as any)._id = (item as any)._id.toString();
        }
        return item;
    });
};

export const toSerializableObject = <T>(data: unknown): T => {
    if (Array.isArray(data)) {
        throw new Error('Se esperaba un solo objeto');
    }

    if (data && (data as any)._id) {
        (data as any)._id = (data as any)._id.toString();
    }

    return data as T;
};

