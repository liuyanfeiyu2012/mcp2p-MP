// miniprogram/page/lenglish/pages/rank/rank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // videoList: [{
    //   avatar: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83erDQxchvFBeGpQlXr1FSxwDCIkicb5ia7sdsJvMO2R9B8jvnBiaFaibPXrRgf3ziaUmY9ia0MKCDI0SicODQ/132",
    //   commentList: [],
    //   likeCount: 0,
    //   videoBgUri: "https://www.mengchongp2p.online/bg/a439893c-cca1-4309-96ad-29495d8acd3a.jpg",
    //   videoId: "a439893c-cca1-4309-96ad-29495d8acd3a",
    //   videoMemo: null,
    //   videoUri: "https://www.mengchongp2p.online/video/a439893c-cca1-4309-96ad-29495d8acd3a.mp4",
    //   wxName: "胖虎。",
    // }]
    imgWidth: 0, 
    imgHeight: 0,
    videoList: [
      {
        avatar: '',
        videoBgUri: '',
        commentList: [],
        likeCount: 0,
        videoId: '',
        videoMemo: null,
        videoUri: '',
        wxName: '',
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

    //处理数据加载的问题
    var that = this;
    // var json_param = options.videoInfo
    // var share_param = options.shareInfo
    // var current = options.current
    // current = parseInt(current)
    var that = this;
    wx.request({
      url: 'https://www.mengchongp2p.online/app/rank/total-rank',
      method: 'get',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {//这里写调用接口成功之后所运行的函数
        console.log('res', res.data);//调出来的数据在控制台显示，方便查看
        that.setData({
          videoList: res.data.result,
        })
      },
      fail: function (res) {//这里写调用接口失败之后所运行的函数
        console.log('.........fail..........');
      }
    })



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
})