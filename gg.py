import time, sys, colorama
colorama.init()

def type_line(text, delay=0.05, color=colorama.Fore.WHITE):
    for ch in text:
        sys.stdout.write(color + ch + colorama.Style.RESET_ALL)
        sys.stdout.flush()
        time.sleep(delay)
    print()

print("\nArz kya hai!........\n")

time.sleep(1)

type_line("Haathon ko sambhale mere haathon mein", 0.06, colorama.Fore.CYAN)
type_line("Kaise haathon ko sambhale mere haathon mein...", 0.06, colorama.Fore.YELLOW)
type_line("Jab tak neend na aaye, inn lakeeron mein...", 0.05, colorama.Fore.MAGENTA)
type_line("Baatein ho.......", 0.07, colorama.Fore.GREEN)
type_line("Haaye ❤️", 0.09, colorama.Fore.RED)
