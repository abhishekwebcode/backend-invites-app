class Company_user_obj {

    constructor(id,title,jobs,logo_url) {
        this.id=id;
        this.title=title;
        this.jobs=jobs;
        this.logo_url=logo_url;
    }

    static from(Object) {
        return new Company_user_obj(Object.id,Object.title,Object.jobs,Object.logo_url);
    }
}