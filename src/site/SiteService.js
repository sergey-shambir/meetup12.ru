
class SiteService
{
    /**
     * @param {Request} req
     */
    getNavbarOptions(req)
    {
        const user = req.user;
        return {
            pageUrl: req.path,
            userName: user && user.name,
            userPhoto: user && user.photoUrl,
        }
    }
}

module.exports = SiteService;
