class ApiFeaturs {
    constructor(collectionQuery, query) {
        this.collectionQuery = collectionQuery;
        this.query = query;
    }
    search() {
        const search = this.query.search ? {
            name: {
                $regex: this.query.search,
                $options: 'i'//for make case insensitive
            }
        } : {};
        // console.log(this.collectionQuery);
        this.collectionQuery = this.collectionQuery.find({ ...search });
        return this;
    }

    filter() {
        const allQuery = { ...this.query }; //destructuring all query 

        const removeQuery = ["search", "page", "limit"];//this all query going to remove from destructured allQuery

        removeQuery.forEach((field) => delete allQuery[field]);// deleting removeQuery data from allQuery
        // console.log(allQuery, "allQuery");

        let queryStr = JSON.stringify(allQuery);
        const regex = /\b(gt|gte|lt|lte)\b/g;
        queryStr = queryStr.replace(regex, (match) => `$${match}`);//opetator er aghe $ use kora lage
        // queryStr = queryStr.replace(regex);
        // console.log(queryStr);

        this.collectionQuery = this.collectionQuery.find(JSON.parse(queryStr));

        return this;
    }

    pagination(productPerPage) {
        const currentPage = Number(this.query.page) || 1;

        const skipProduct = productPerPage * (currentPage - 1);// skip product..such as if current page = 1 then skipProduct = 6*(1-1)=0 , for page 1 skipProduct 0,, for 2nd page skipProduct = 6*(2-1)=6 , skip first 6 product  and page 3 skip first 12 product.. like this

        this.collectionQuery = this.collectionQuery.limit(productPerPage).skip(skipProduct); //limit(productPerpage) er kaj holo productPerpage er soman product dekabe... r skip(skipProduct) er kaj holo first page 0 product skip korbe ,,, 2nd page e 6 ta product skip korbe 3 page e first 12 ta product skip korbe

        return this;
    }

};

module.exports = ApiFeaturs;