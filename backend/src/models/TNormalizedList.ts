export type TNormalizedList<T> = {
    values: {
        byId: {
            [id: string]: T;
        };
    };
    allIds: string[];
};
