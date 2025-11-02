export class Pagination {
  private skip: number;

  constructor(private model, private query?, private page?, private limit?, private sort={}, private populate?) {
    this.model = model;
    this.query = query;
    this.page = parseInt(page, 10) || 1;
    this.limit = parseInt(limit, 10) || 10;
    this.skip = (this.page - 1) * this.limit;
    this.sort = sort;
    this.populate = populate;
  }


  createQueryObject() {
    let queryObject = this.model
      .find(this.query)
      .sort(this.sort)
      .skip(this.skip)
      .limit(this.limit);

    if (this.populate) {
      queryObject.populate(this.populate);
    }
    return queryObject;
  }


  async paginate() {
    const total = await this.model.countDocuments(this.query);
    const results = await this.createQueryObject();

    return {
      status: "success",
      pagination: {
        total,
        count: results.length,
        page: this.page,
        pages: Math.ceil(total / this.limit),
      },
      data: {
        [this.model.collection.collectionName]: results,
      },
    };
  }
}