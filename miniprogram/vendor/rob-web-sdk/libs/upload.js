const constants = require('./constants');
const request = require('./request');
const utils = require('./utils');
const oss = require('./oss');
var video2local = function (callback, callend, app) {
  console.log('callback', callback)
  console.log('callend', callend)
    console.log(app)
    // 让用户选择一张图片
    wx.chooseVideo({
      sourceType: ['album'],
      success: chooseResult => {
        var tempFilePath = chooseResult.tempFilePath
        var videoTime = chooseResult.duration
        let tvideo = chooseResult.duration
        let sizevideo = chooseResult.size
        if (tvideo > 5 * 60) {
          wx.showToast({
            title: '视频时长过长',
            icon: 'none',
          })
          return
        }
        if (sizevideo > 1024 * 1024 * 30) {
          wx.showToast({
            title: '视频文件过大',
            icon: 'none',
          })
          return
        }
        wx.showLoading({
          title: '正在上传...',
          mask: true,
        })

        wx.uploadFile({
          url: 'https://www.mengchongp2p.online/app/video/upload',
          filePath: tempFilePath,
          name: 'file',
          formData:{
            uid: app.globalData.userInfo.openId,
            file: tempFilePath,
            videoTime: videoTime
          },
          success: res=>{
            wx.showToast({
              title: '上传成功',
              icon: 'none',
            })
            wx.navigateTo({
              url: '/page/lenglish/pages/mine/mine',
            })
            console.info('upload res:' + res)
          },
          complete: res=>{
            //callend(res)
          }
        })
        // 将图片上传至云存储空间
        // wx.cloud.uploadFile({
        //   // 指定上传到的云路径
        //   cloudPath: file_name,
        //   // 指定要上传的文件的小程序临时文件路径
        //   filePath: file_path,
        //   // 成功回调
        //   success: res => {
        //     console.log('上传成功', res)
        //     //callback(res)
        //     getUploadFileUrl(res.fileID, callback, callend)
        //   },
        //   complete: function (res) {
        //     wx.hideLoading()
        //   }
        // })
      },
      fail: function (err) {
        console.log('chooseVideo', err)
        wx.showToast({
          title: '上传失败！',
          icon: 'none',
        })
      }
    })
  
  
}

var file2local = function (file_path, callback) {
  var file_list = file_path.split('/')
  var file_name = file_list[file_list.length-1]
  wx.cloud.uploadFile({
    cloudPath: file_name, // 上传至云端的路径
    filePath: file_path, // 小程序临时文件路径
    success: res => {
      // 返回文件 ID
      callback(res)
    },
    fail: function (err){
      console.error
      console.log('wx.cloud.uploadFile', err)
      wx.showToast({
        title: '上传失败！',
        icon: 'none',
      })
    }
  })
}

var getUploadFileUrl = function (fileID, callback, callend){
  wx.cloud.getTempFileURL({
    fileList: [{fileID,
      maxAge: 60 * 60 * 24}],
    success: res => {
      // fileList 是一个有如下结构的对象数组
      // [{
      //    fileID: 'cloud://xxx.png', // 文件 ID
      //    tempFileURL: '', // 临时文件网络链接
      //    maxAge: 120 * 60 * 1000, // 有效期
      // }]
      console.log(res.fileList)
      callback(res)
    },
    fail: console.error,
    complete: function(res){
      callend(res)
    }
  })
}

module.exports = {
  video2local: video2local,
  file2local: file2local,
  getUploadFileUrl: getUploadFileUrl
};