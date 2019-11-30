// miniprogram/page/lenglish/pages/advertising/advertising.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    miao: 3,
    time: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.time = setInterval(function () {
      that.setData({
        miao: that.data.miao - 1
      })
      if (that.data.miao == 1) {
        clearInterval(this.time);
        wx.navigateTo({    //保留当前页面，跳转到应用内的某个页面（最多打开5个页面，之后按钮就没有响应的）
          url: "/page/lenglish/pages/index/index"
        })
      }
    }, 1000)
  },
  // cliadv: function () {
  //   clearInterval(this.time)
  //   wx.switchTab({    //保留当前页面，跳转到应用内的某个页面（最多打开5个页面，之后按钮就没有响应的）
  //     url: "/page/lenglish/pages/index/index"
  //   })
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.time);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})