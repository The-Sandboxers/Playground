import requests

class IGDBRequest:
    def __init__(self, clientId, access_token):
        self.api = "https://api.igdb.com/v4/"
        self.headers = []
        self.clientId = clientId
        self.access_token = access_token
        self.validEndpoints = {
            "age_ratings",
            "age_rating_content_descriptions",
            "alternative_names",
            "artworks",
            "characters",
            "character_mug_shots",
            "collections",
            "collection_memberships",
            "collection_membership_types",
            "collection_relations",
            "collection_relation_types",
            "collection_types",
            "companies",
            "company_logos",
            "covers",
            "company_websites",
            "events",
            "event_logos",
            "event_networks",
            "external_games",
            "franchises",
            "games",
            "game_engines",
            "game_engine_logos",
            "game_localizations",
            "game_modes",
            "game_times_to_beat",
            "game_versions",
            "game_version_features",
            "game_version_feature_values",
            "game_videos",
            "genres",
            "involved_companies",
            "keywords",
            "languages",
            "language_supports",
            "language_support_types",
            "multiplayer_modes",
            "network_types",
            "platforms",
            "platform_families",
            "platform_logos",
            "platform_versions",
            "platform_version_companies",
            "platform_version_release_dates",
            "platform_websites",
            "player_perspectives",
            "popularity_primitives",
            "popularity_types",
            "regions",
            "release_dates",
            "release_date_statuses",
            "screenshots",
            "search",
            "themes",
            "websites",
        }
        # self.link = self.api + endpoint
        # if endpoint not in self.validEndpoints:
        #     raise ValueError("argument, 'endpoint' not a valid input.")
        # else:
        #     self.endpoint = endpoint
        self.fields = []
        
    def changeEndpoint(self, newEndpoint):
        self.link = self.api + newEndpoint
    
    def changeFields(self, newFields):
        self.fields = newFields
        
    def __request(self, endpoint, fields):
        response = requests.post(self.api + endpoint, **{'headers': {'Client-ID':self.clientId, 'Authorization': f'Bearer {self.access_token}'}, 'data': f'{self.fields}'})
        return response.json()