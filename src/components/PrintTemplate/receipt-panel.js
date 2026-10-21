export default {
  "panels": [{
    "index": 0,
    "name": 1,
    "height": 297,
    "width": 210,
    "paperHeader": 49.5,
    "paperFooter": 780,
    "printElements": [{
      "options": {
        "left": 402.5,
        "top": 35,
        "height": 40,
        "width": 160,
        "title": "바코드",
        "barcodeType": "code128",
        "testData": "barcode",
        "textType": "barcode",
        "fields": [{
          "text": "입고 전표 번호",
          "field": "orderNo"
        },
          {
            "text": "업무 주문 번호",
            "field": "bizOrderNo"
          }
        ],
        "field": "orderNo",
        "coordinateSync": false,
        "widthHeightSync": false
      },
      "printElementType": {
        "title": "바코드",
        "type": "barcode"
      }
    },
      {
        "options": {
          "left": 20,
          "top": 42.5,
          "height": 27,
          "width": 350,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            },
            {
              "text": "창고",
              "field": "warehouse"
            }
          ],
          "title": "입고 전표",
          "field": "orderNo",
          "coordinateSync": false,
          "widthHeightSync": false,
          "fontSize": 18,
          "fontWeight": "600",
          "lineHeight": 26.25,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 20,
          "top": 97.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "입고 유형",
          "field": "optType",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0,
          "right": 139.5,
          "bottom": 108,
          "vCenter": 79.5,
          "hCenter": 103.125
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 340,
          "top": 97.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "입고 상태",
          "field": "orderStatus",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 20,
          "top": 122.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "공급업체",
          "field": "merchantName",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 340,
          "top": 122.5,
          "height": 9.75,
          "width": 150,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "업무 주문 번호",
          "field": "bizOrderNo",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0,
          "right": 489.75,
          "bottom": 131.25,
          "vCenter": 414.75,
          "hCenter": 126.375
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 20,
          "top": 147.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "창고",
          "field": "warehouseName",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 20,
          "top": 172.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "수량",
          "field": "totalQuantity",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 340,
          "top": 172.5,
          "height": 9.75,
          "width": 150,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "총금액",
          "field": "totalAmount",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0,
          "right": 489.75,
          "bottom": 131.25,
          "vCenter": 414.75,
          "hCenter": 126.375
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 20,
          "top": 197.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "등록자",
          "field": "createBy",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 340,
          "top": 197.5,
          "height": 9.75,
          "width": 150,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "등록 일시",
          "field": "createTime",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0,
          "right": 489.75,
          "bottom": 131.25,
          "vCenter": 414.75,
          "hCenter": 126.375
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 20,
          "top": 222.5,
          "height": 9.75,
          "width": 200,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "처리자",
          "field": "updateBy",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 340,
          "top": 222.5,
          "height": 9.75,
          "width": 150,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "처리 일시",
          "field": "updateTime",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0,
          "right": 489.75,
          "bottom": 131.25,
          "vCenter": 414.75,
          "hCenter": 126.375
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      },
      {
        "options": {
          "left": 17.5,
          "top": 272.5,
          "height": 54,
          "width": 550,
          "field": "table",
          "groupFieldsFormatter": "function(type,options,data){ return [\"name\"] }",
          "columns": [
            [{
              "width": 78.57142857142857,
              "title": "상품명",
              "field": "itemName",
              "checked": true,
              "columnId": "itemName",
              "fixed": false,
              "rowspan": 1,
              "colspan": 1
            },
              {
                "width": 78.57142857142857,
                "title": "규격명",
                "field": "skuName",
                "checked": true,
                "columnId": "skuName",
                "fixed": false,
                "rowspan": 1,
                "colspan": 1
              },
              {
                "width": 78.57142857142857,
                "align": "right",
                "title": "수량",
                "field": "quantity",
                "checked": true,
                "columnId": "quantity",
                "fixed": false,
                "rowspan": 1,
                "colspan": 1,
                "tableSummary": "sum",
                "tableSummaryAlign": "right",
                "tableSummaryNumFormat": "0"
              },
              {
                "width": 78.57142857142857,
                "align": "right",
                "title": "금액(위안)",
                "field": "amount",
                "checked": true,
                "columnId": "amount",
                "fixed": false,
                "rowspan": 1,
                "colspan": 1,
                "tableSummary": "sum",
                "tableSummaryAlign": "right"
              }
            ]
          ]
        },
        "printElementType": {
          "title": "표",
          "type": "table",
          "editable": true,
          "columnDisplayEditable": true,
          "columnDisplayIndexEditable": true,
          "columnTitleEditable": true,
          "columnResizable": true,
          "columnAlignEditable": true,
          "isEnableEditField": true,
          "isEnableContextMenu": true,
          "isEnableInsertRow": true,
          "isEnableDeleteRow": true,
          "isEnableInsertColumn": true,
          "isEnableDeleteColumn": true,
          "isEnableMergeCell": true
        }
      },
      {
        "options": {
          "left": 20,
          "top": 247.5,
          "height": 9.75,
          "width": 500,
          "fields": [{
            "text": "입고 전표 번호",
            "field": "orderNo"
          },
            {
              "text": "공급업체",
              "field": "merchantName"
            },
            {
              "text": "업무 주문 번호",
              "field": "bizOrderNo"
            },
            {
              "text": "입고 유형",
              "field": "optType"
            },
            {
              "text": "입고 상태",
              "field": "orderStatus"
            },
            {
              "text": "등록일",
              "field": "createTime"
            },
            {
              "text": "비고",
              "field": "remark"
            }
          ],
          "title": "비고",
          "field": "remark",
          "coordinateSync": false,
          "widthHeightSync": false,
          "qrCodeLevel": 0,
          "right": 139.5,
          "bottom": 233.25,
          "vCenter": 79.5,
          "hCenter": 228.375
        },
        "printElementType": {
          "title": "텍스트",
          "type": "text"
        }
      }
    ],
    "paperNumberLeft": 565.5,
    "paperNumberTop": 819,
    "paperNumberContinue": true,
    "watermarkOptions": {}
  }]
}
