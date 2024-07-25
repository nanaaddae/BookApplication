from django.contrib import admin
from django.urls import path, include, re_path
from . import views

urlpatterns = [

    path('search/', views.search_books, name='search_books'),
    path('check_db/', views.check_db, name='check_db'),
    path('api/login/', views.login_view, name='login'),
    path('api/register/', views.register, name='register'),
    path('api/user/', views.get_user_data, name='get_user_data'),
    path('api/add-book/', views.add_book_to_list, name='add_book_to_list'),
    path('api/wishlist', views.get_wishlist, name='get_wishlist'),
    path('api/wishlist/remove/<int:book_id>', views.remove_from_wishlist, name='remove_from_wishlist'),
    path('api/mark-as-read/<int:book_id>/', views.mark_as_read, name='mark_as_read'),
    path('api/readlist/', views.get_readlist, name='get_readlist'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/check-book/', views.check_book, name='check_book'),
    path('api/remove-from-readlist/', views.remove_from_readlist, name='remove-from-readlist'),

]
