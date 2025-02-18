'''
Added on 2025-01-29 by Victor Fawole:
- Added function to get big cover link.
'''
def get_cover_big(link):
    newLink = "https:" + link.replace("t_thumb", "t_cover_big")
    return newLink