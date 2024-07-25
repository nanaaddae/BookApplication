from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import requests
import json
from urllib.parse import unquote


from bookproject.models import User,Book, WishList , ReadList
from django.views.decorators.http import require_POST, require_http_methods


@csrf_exempt
@require_POST
def remove_from_readlist(request):
    try:
        data = json.loads(request.body)
        book_id = data.get('book_id')

        if not book_id:
            return JsonResponse({'error': 'Book ID is required'}, status=400)

        try:
            readlist = ReadList.objects.get(user=request.user)
            book = Book.objects.get(id=book_id)

            if book in readlist.books.all():
                readlist.books.remove(book)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': 'Book not found in readlist'}, status=404)
        except ReadList.DoesNotExist:
            return JsonResponse({'error': 'Readlist not found'}, status=404)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

@login_required
def get_user_data(request):
    user = request.user
    return JsonResponse({
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'username': user.username,
    })




@login_required
def get_wishlist(request):
    try:
        wishlist = WishList.objects.get(user=request.user)
        books = [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "cover_url": book.cover_url
            } for book in wishlist.books.all()
        ]
        return JsonResponse(books, safe=False)
    except WishList.DoesNotExist:
        return JsonResponse([], safe=False)

@csrf_exempt
@login_required
def add_book_to_list(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=405)

    data = json.loads(request.body)
    title = data.get('title')
    author = data.get('author')
    first_publish_year = data.get('first_publish_year')
    cover_url = data.get('cover_url')
    list_type = data.get('list_type')  # 'wishlist' or 'readlist'

    if not title or not author or not list_type:
        return JsonResponse({"error": "Missing required fields"}, status=400)

    book, _ = Book.objects.get_or_create(
        title=title,
        author=author,
        defaults={'first_publish_year': first_publish_year, 'cover_url': cover_url}
    )

    if list_type == 'wishlist':
        wishlist, _ = WishList.objects.get_or_create(user=request.user)
        wishlist.books.add(book)
        message = "Book added to wishlist"
    elif list_type == 'readlist':
        readlist, _ = ReadList.objects.get_or_create(user=request.user)
        readlist.books.add(book)
        message = "Book added to read list"
    else:
        return JsonResponse({"error": "Invalid list type"}, status=400)

    return JsonResponse({"message": message}, status=200)

def search_books(request):
    query = request.GET.get('query')
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 10))

    if query:
        url = f'https://openlibrary.org/search.json?title={query.replace(" ", "+")}'
        response = requests.get(url)
        data = response.json()
        books = data.get('docs', [])

        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        paginated_books = books

        total_count = len(books)

        response_data = {
            'books': paginated_books,
            'total_count': total_count
        }

        return JsonResponse(response_data)
    else:
        return JsonResponse({"error": "No query parameter provided"}, status=400)

def check_db(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
    return JsonResponse({"tables": tables})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Login successful"}, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=401)


@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')  # Default to an empty string if not provided
        last_name = data.get('last_name', '')  # Default to an empty string if not provided

        if not username or not email or not password:
            return JsonResponse({'message': 'Please provide username, email, and password'}, status=400)

        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Username or email already exists'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        return JsonResponse({'message': 'User registered successfully'}, status=201)

@login_required
@require_POST
def mark_as_read(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
        wishlist = WishList.objects.get(user=request.user)
        readlist, created = ReadList.objects.get_or_create(user=request.user)

        # Remove from wishlist
        wishlist.books.remove(book)

        # Add to readlist
        readlist.books.add(book)

        return JsonResponse({"message": "Book marked as read and moved to read list"}, status=200)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found"}, status=404)
    except WishList.DoesNotExist:
        return JsonResponse({"error": "Wishlist not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
@require_http_methods(["DELETE"])
def remove_from_wishlist(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
        wishlist = WishList.objects.get(user=request.user)
        wishlist.books.remove(book)
        return JsonResponse({"message": "Book removed from wishlist"}, status=200)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found"}, status=404)
    except WishList.DoesNotExist:
        return JsonResponse({"error": "Wishlist not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def get_readlist(request):
    try:
        readlist = ReadList.objects.get(user=request.user)
        books = readlist.books.all()
        books_data = [{"id": book.id, "title": book.title, "author": book.author, "first_publish_year": book.first_publish_year, "cover_url": book.cover_url} for book in books]
        return JsonResponse({"books": books_data}, status=200)  # Ensure data is returned as {"books": [...] }
    except ReadList.DoesNotExist:
        return JsonResponse({"books": []}, status=200)  # Return an empty array if no read list is found
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logged out successfully."})

@csrf_exempt
def check_book(request):
    if request.method == 'GET':
        title = request.GET.get('title')
        list_type = request.GET.get('list_type')

        if list_type == 'wishlist':
            list_model = WishList
        elif list_type == 'readlist':
            list_model = ReadList
        else:
            return JsonResponse({'exists': False}, status=400)

        exists = list_model.objects.filter(title=title).exists()
        return JsonResponse({'exists': exists})
    return JsonResponse({'error': 'Invalid request'}, status=400)