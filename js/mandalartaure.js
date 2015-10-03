google.load("feeds", "1");

var mandalart = [];

// テーブルを配列に格納
for(var i=0; i<9; i++){
	var tr = $('table#'+i+' tr');
	for(var j=0; j<tr.length; j++){
		var cells = tr.eq(j).children();
		for(var k=0; k<cells.length; k++){
			if(mandalart[i] == undefined){
				mandalart[i] = [];
			}
			mandalart[i][j*3+k] = cells.eq(k);
		}
	}
}

var indexes = [0, 1, 2, 3, 5, 6, 7, 8];
function jfeed(index, callback){

	var keyword = mandalart[index][4].text();

	// kizasi.jpのkizAPIを利用して、関連語を検索
	var feedurl = 'proxy.php?url='+encodeURIComponent('http://kizasi.jp/kizapi.py?span=1m&kw_expr='+keyword+'&type=coll');

	jQuery.getFeed({
		url: feedurl,
		success: function(feed){

			var keywords = [];
			// 取得したRSSより関連語をランダムに最大8個取得
			for(var i=0; i<feed.items.length; i++){
				// ランダムにitemを取得
				var rand = Math.floor(Math.random()*feed.items.length);
				var item = feed.items[rand];
				keywords.push(item.title);

				// 取得したitemを削除
				feed.items.splice(rand, 1);

				if(keywords.length == 8) break;
			}

			console.log(keywords);

			// 取得した関連語を周囲に配置する
			for(var i=0; i<9; i++){
				if(keywords.length != 0 && i != 4 ){
					var keyword = keywords.shift();
					mandalart[index][i].text(keyword);
					if(index == 4){
						mandalart[i][4].text(keyword);
					}
				}
			}

			if(indexes.length > 0){
				jfeed(indexes.shift());
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			// timeoutしたらリクエストを再送信する
			if(textStatus === 'timeout'){
				jfeed(index);
			}
		}
	});
}

var repeat = -1;
function search(index, callback){
	var keyword = mandalart[index][4].text();

	// kizasi.jpのkizAPIを利用して、関連語を検索
	var feedurl = 'http://kizasi.jp/kizapi.py?span=1m&kw_expr='+keyword+'&type=coll';
	console.log(index+", keyword : "+keyword+", url :"+feedurl);

	var feed = new google.feeds.Feed(feedurl);
	feed.setNumEntries(60);
	feed.load(function(result){
		if(!result.error){
			var keywords = [];
			// 取得したRSSより関連語を取得
			for(var i=0; i<result.feed.entries.length; i++){
				var entry = result.feed.entries[i];
				keywords.push(entry.title);
			}

			console.log(keywords);

			// 取得した関連語を周囲に配置する
			for(var i=0; i<9; i++){
				if(keywords.length != 0 && i != 4 ){
					var keyword = keywords.shift();
					mandalart[index][i].text(keyword);
					if(index == 4){
						mandalart[i][4].text(keyword);
					}
				}
			}
			// マスを全て埋めたら、コールバック関数を実行
			if(callback != null){
				callback();
			}
		}
		else{
			alert('失敗');
			console.log(result.error);
		}
	});
}

function generate(){
	var keyword = $('[name=keyword]').val();
	mandalart[4][4].text(keyword);

	jfeed(4);
}
