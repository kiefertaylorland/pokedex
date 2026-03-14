#!/usr/bin/env python3
"""
Script to add romaji (romanized) versions of Japanese text to pokedex_data.json
This adds romaji for Pokemon names, types, and move names to help with pronunciation
"""

import json
import sys

# Hiragana to Romaji mapping
HIRAGANA_TO_ROMAJI = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
    'っ': '', # small tsu - handled separately
    'ー': '-', # long vowel mark
    '・': ' ', # interpunct
}

# Katakana to Romaji mapping
KATAKANA_TO_ROMAJI = {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',
    'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo',
    'ッ': '', # small tsu - handled separately
    'ー': '-', # long vowel mark
    '・': ' ', # interpunct
    'ァ': 'a', 'ィ': 'i', 'ゥ': 'u', 'ェ': 'e', 'ォ': 'o',
}

def kana_to_romaji(text):
    """Convert hiragana or katakana text to romaji"""
    if not text:
        return ''
    
    result = []
    i = 0
    while i < len(text):
        char = text[i]
        
        # Check if it's a small tsu (っ or ッ) before a consonant
        if char in ('っ', 'ッ') and i + 1 < len(text):
            next_char = text[i + 1]
            next_romaji = HIRAGANA_TO_ROMAJI.get(next_char) or KATAKANA_TO_ROMAJI.get(next_char)
            if next_romaji and next_romaji[0] not in 'aiueony':
                # Double the following consonant
                result.append(next_romaji[0])
            i += 1
            continue
        
        # Check for combinations (e.g., きゃ = kya)
        if i + 1 < len(text):
            combo = char + text[i + 1]
            # Common combinations
            combos = {
                'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
                'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
                'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
                'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
                'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
                'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
                'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
                'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
                'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
                'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
                'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
                # Katakana combinations
                'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
                'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
                'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
                'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
                'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
                'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
                'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
                'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
                'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
                'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
                'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
                'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo',
                'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
                'ヴァ': 'va', 'ヴィ': 'vi', 'ヴ': 'vu', 'ヴェ': 've', 'ヴォ': 'vo',
            }
            if combo in combos:
                result.append(combos[combo])
                i += 2
                continue
        
        # Single character conversion
        romaji = HIRAGANA_TO_ROMAJI.get(char) or KATAKANA_TO_ROMAJI.get(char)
        if romaji:
            result.append(romaji)
        elif char in ('♀', '♂', '々', ' ', '　'):
            # Keep special characters as is
            if char == '♀':
                result.append('(f)')
            elif char == '♂':
                result.append('(m)')
            elif char == '々':
                # Repetition mark - repeat previous syllable
                if result:
                    result.append(result[-1])
            elif char in (' ', '　'):
                result.append(' ')
        else:
            # Unknown character, keep as-is
            result.append(char)
        
        i += 1
    
    # Join and capitalize first letter
    romaji_text = ''.join(result)
    romaji_text = romaji_text.strip()
    
    # Capitalize first letter of each word
    return ' '.join(word.capitalize() if word else '' for word in romaji_text.split())

def add_romaji_to_data(input_file, output_file):
    """Add romaji fields to the pokedex data"""
    print(f"Loading data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Processing {len(data)} Pokemon...")
    
    for pokemon in data:
        # Add romaji for Pokemon name
        if 'name_jp' in pokemon:
            pokemon['name_romaji'] = kana_to_romaji(pokemon['name_jp'])
        
        # Add romaji for types
        if 'types_jp' in pokemon:
            pokemon['types_romaji'] = [kana_to_romaji(t) for t in pokemon['types_jp']]
        
        # Add romaji for moves
        if 'moves' in pokemon:
            for move in pokemon['moves']:
                if 'name_jp' in move:
                    move['name_romaji'] = kana_to_romaji(move['name_jp'])
                if 'type_jp' in move:
                    move['type_romaji'] = kana_to_romaji(move['type_jp'])
    
    print(f"Writing updated data to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ Romaji data added successfully!")
    
    # Print a sample for verification
    print("\nSample Pokemon with romaji:")
    sample = data[0]
    print(f"  Name: {sample['name_jp']} ({sample['name_romaji']})")
    print(f"  Types: {', '.join(f'{t} ({r})' for t, r in zip(sample['types_jp'], sample['types_romaji']))}")
    if sample['moves']:
        print(f"  First move: {sample['moves'][0]['name_jp']} ({sample['moves'][0]['name_romaji']})")

if __name__ == '__main__':
    input_file = 'pokedex_data.json'
    output_file = 'pokedex_data.json'
    
    try:
        add_romaji_to_data(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
