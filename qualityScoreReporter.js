/**
 * Quality Score Listings Reporter
 * 
 * Used to generate a quick report of quality score totals for listings.
 * 
 * @version 1.0
 * @author sv-cmswo
 * @date 05/03/2019
 **/

/**
 * Instructions:
 * 1. Create new Google spreadsheet
 * 2. Update "sheetId" below with your sheet id
 * 3. Share sheet with this user: 743184255003-2tbvikqou0c38ruhrmddno3kc7hnsmfr@developer.gserviceaccount.com
 * 4. Toggle "useTestConfig" to determine which config to use.
 **/

var googleapisLib = require('@sv/googleapisLib');

(async function main() {
	const sheetId = '1TopHa7dalN3Iaolz8VgtD2nkc468LcKJSSfMENk37yg';

	// Use test config below OR use clientConfig.json qualityScoreFactors
	const useTestConfig = true;
	const testConfigQualityScoreFactors = {
		'hasYelp'        : { 'weight' : { 'value' : 10  } },
		"yelpScore"      : { "weight" : { "value" : 25  } },
		'hasTripAdvisor' : { 'weight' : { 'value' : 10  } },
		'hasDescription' : { 'weight' : { 'value' : 15  } },
		'hasPhone'       : { 'weight' : { 'value' : 2   } },
		'hasEmail'       : { 'weight' : { 'value' : 2   } },
		'hasWebUrl'      : { 'weight' : { 'value' : 10  } },
		'imageCount'     : { 'weight' : { 'value' : 5   }, 'max' : { 'value' : 15 } },
		'amenityCount'   : { 'weight' : { 'value' : 0.5 }, 'max' : { 'value' : 5  } },
		'rank'           : { 'weight' : { 'value' : -10 } }
	};

	const sheetTitle = `${site.config.settings.clientLong} - Quality Score Reporter`;

	await clearSheet(sheetId).catch(errorFn);
	await formatSheet(sheetId, sheetTitle).catch(errorFn);

	let config = (useTestConfig)
               ? testConfigQualityScoreFactors
               : site.plugins.listings._def.settings.qualityScoreFactors;

	let listingMeta = await getListingMeta().catch(errorFn);
	let catStrings = listingMeta[0].listingcats.filter(c => c.active).map(c => `site_primary_catid_${c.catid}`);

	let filters = { 'filter_tags' : { '$in' : catStrings } };
	let options = { 'sort' : { 'rankorder' : 1, 'sortcompany' : 1 } };

	let listings = await getListings(filters, options).catch(errorFn);
	let scoredListings = calculateQualityScores(listings, listingMeta, config);
	let result = await populateSheet(sheetId, convertDataToSheetArrays(scoredListings)).catch(errorFn);

	cb(null, result);
})();

function convertDataToSheetArrays(data) {
	return [Object.keys(data[0]), ...data.map(d => Object.values(d))];
}

function populateSheet(sheetId, data) {
	return new Promise((resolve, reject) => {
		googleapisLib.callApi({
			service : 'sheets',
			apiArgs : { version : 'v4' },
			method : 'spreadsheets.values.batchUpdate',
			args : {
				spreadsheetId : sheetId,
				resource : {
					valueInputOption : 'USER_ENTERED',
					data : [
						{
							range : 'A1:ZZZ100000',
							values : data
						}
					]
				}
			},
			jwtArgs : {
				permissions : ['https://www.googleapis.com/auth/spreadsheets']
			}
		}, (err, result) => {
			if (err) { reject(err); }
			resolve(result);
		});
	});
}

function clearSheet(sheetId) {
	return new Promise((resolve, reject) => {
		googleapisLib.callApi({
			service : 'sheets',
			apiArgs : { version : 'v4' },
			method : 'spreadsheets.values.batchClear',
			args : {
				spreadsheetId : sheetId,
				resource : { ranges : 'A1:ZZZ100000' }
			},
			jwtArgs : {
				permissions : ['https://www.googleapis.com/auth/spreadsheets']
			}
		}, (err, results) => {
			if (err) { reject(err); }
			resolve(results);
		});
	});
}

function formatSheet(sheetId, title) {
	return new Promise((resolve, reject) => {
		googleapisLib.callApi({
			service : 'sheets',
			apiArgs : { version : 'v4' },
			method : 'spreadsheets.batchUpdate',
			args : {
				spreadsheetId : sheetId,
				resource : {
					requests : [
						{
							updateSpreadsheetProperties : {
								properties : {
									title : title
								},
								fields : 'title'
							}
						}
					]
				}
			},
			jwtArgs : {
				permissions : ['https://www.googleapis.com/auth/spreadsheets']
			}
		}, (err, result) => {
			if (err) { reject(err); }
			resolve(result);
		});
	});
}

function calculateQualityScores(listings, meta, config) {
	let scoredList = [];

	listings.forEach(listing => {
		const qualityData = site.plugins.listings.calculateQualityScore({ item: listing, meta: meta }, config);

		scoredList.push({
			ListingID           : listing.recid,
			Company             : listing.company,
			RankName            : listing.rankname || '-- N/A --',
			RankOrder           : listing.rankorder,
			QualityScore        : qualityData.score,
			hasYelp             : qualityData.calculated.hasYelp.value,
			hasYelpScore        : qualityData.calculated.hasYelp.score,
			hasTripAdvisor      : qualityData.calculated.hasTripAdvisor.value,
			hasTripAdvisorScore	: qualityData.calculated.hasTripAdvisor.score,
			hasDescription      : qualityData.calculated.hasDescription.value,
			hasDescriptionScore : qualityData.calculated.hasDescription.score,
			hasPhone            : qualityData.calculated.hasPhone.value,
			hasPhoneScore       : qualityData.calculated.hasPhone.score,
			hasEmail            : qualityData.calculated.hasEmail.value,
			hasEmailScore       : qualityData.calculated.hasEmail.score,
			hasWebUrl           : qualityData.calculated.hasWebUrl.value,
			hasWebUrlScore      : qualityData.calculated.hasWebUrl.score,
			imageCount          : qualityData.calculated.imageCount.value,
			imageCountScore     : qualityData.calculated.imageCount.score,
			amenityCount        : qualityData.calculated.amenityCount.value,
			amenityCountScore   : qualityData.calculated.amenityCount.score,
			rank                : qualityData.calculated.rank.value || '--NONE--',
			rankScore           : qualityData.calculated.rank.score,
		});
	});

	return scoredList;
}

function getListingMeta() {
	return new Promise((resolve, reject) => {
		site.plugins.listings.apis.listingmeta.find({}, (err, data) => {
			if (err) { reject(err); }
			resolve(data);
		});
	});
}

function getListings(filters, options) {
	return new Promise((resolve, reject) => {
		site.plugins.listings.apis.listings.find(filters, options, (err, data) => {
			if (err) { reject(err); }
			resolve(data);
		});
	});
}

function errorFn(err) {
	console.log(err);
	return err;
}
